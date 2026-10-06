import mongoose, { Schema } from 'mongoose';

const options = { timestamps: true, strict: 'throw' as const, optimisticConcurrency: true };
const text = (max = 200) => ({ type: String, trim: true, maxlength: max });
const requiredText = (max = 200) => ({ ...text(max), required: true });
const oid = (ref: string) => ({ type: Schema.Types.ObjectId, ref });
const localized = new Schema({ en: text(10000), ur: text(10000) }, { _id: false, strict: 'throw' });
export const roles = ['super_admin', 'admin', 'editor', 'case_manager'] as const;
export type Role = typeof roles[number];
const review = { type: String, enum: ['pending', 'approved', 'hidden'], default: 'pending' };
export const assetRefSchema = new Schema({
  assetId: { ...oid('Asset'), required: true }, publicId: requiredText(300),
  resourceType: { type: String, enum: ['image', 'raw'], required: true },
  deliveryType: { type: String, enum: ['authenticated', 'upload'], required: true },
  format: requiredText(20), bytes: { type: Number, required: true, min: 1 },
  width: Number, height: Number, version: Number, sha256: requiredText(64),
}, { _id: false, strict: 'throw' });
const personal = {
  name: requiredText(150), fatherName: text(150), email: { ...text(254), lowercase: true },
  phone: requiredText(30), province: requiredText(100), district: requiredText(100), address: requiredText(1000),
};
const consent = new Schema({ version: requiredText(50), acceptedAt: { type: Date, required: true } }, { _id: false });
const note = new Schema({ body: requiredText(5000), actorId: oid('User'), at: { type: Date, default: Date.now } }, { _id: false });
const history = new Schema({ from: text(50), to: requiredText(50), actorId: oid('User'), at: { type: Date, default: Date.now } }, { _id: false });

const user = new Schema({
  email: { ...requiredText(254), lowercase: true, unique: true }, passwordHash: { type: String, required: true, select: false },
  name: requiredText(150), role: { type: String, enum: roles, required: true }, active: { type: Boolean, default: true },
  authVersion: { type: Number, default: 0 }, lastLogin: Date,
  resetHash: { type: String, select: false }, resetExpiresAt: Date,
}, options);
export const User = mongoose.model('User', user);
const authSession = new Schema({
  userId: { ...oid('User'), required: true, index: true }, refreshHash: { type: String, required: true, unique: true, select: false },
  familyId: { type: String, required: true, index: true }, expiresAt: { type: Date, required: true },
  revokedAt: Date, replacedBy: oid('AuthSession'), csrfHash: { type: String, required: true, select: false },
}, options);
// Keep expired/revoked records briefly so refresh replay can revoke the family.
authSession.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });
export const AuthSession = mongoose.model('AuthSession', authSession);
const member = new Schema({
  ...personal, membershipNumber: { ...requiredText(40), unique: true }, applicationId: oid('MembershipApplication'),
  membershipType: requiredText(100), status: { type: String, enum: ['active', 'suspended', 'expired', 'archived'], default: 'active' },
  approvedAt: Date, validUntil: Date, notes: [note],
}, options);
member.index({ applicationId: 1 }, { unique: true, partialFilterExpression: { applicationId: { $type: 'objectId' } } });
export const Member = mongoose.model('Member', member);
const fee = new Schema({ amountPaisa: { type: Number, min: 0, required: true }, currency: { type: String, enum: ['PKR'], required: true }, policyVersion: requiredText(50), validityMonths: { type: Number, min: 1, max: 120, required: true } }, { _id: false });
const membershipApplication = new Schema({
  ...personal, reference: { ...requiredText(40), unique: true }, submissionKey: { ...requiredText(64), unique: true },
  payloadHash: requiredText(64), membershipType: requiredText(100), feeSnapshot: { type: fee, required: true },
  paymentReference: requiredText(200), paymentProof: { type: assetRefSchema, required: true },
  paymentStatus: { type: String, enum: ['unverified', 'verified', 'rejected'], default: 'unverified' },
  status: { type: String, enum: ['pending', 'needs_info', 'approved', 'rejected', 'withdrawn'], default: 'pending' },
  reviewerId: oid('User'), reviewedAt: Date, reason: text(2000), notes: [note], memberId: oid('Member'),
  consent: { type: consent, required: true }, informationTokenHash: { type: String, select: false }, informationExpiresAt: Date,
}, options);
membershipApplication.index({ status: 1, createdAt: -1 });
export const MembershipApplication = mongoose.model('MembershipApplication', membershipApplication);
const complaint = new Schema({
  ...personal, trackingId: { ...requiredText(40), unique: true }, submissionKey: { ...requiredText(64), unique: true }, payloadHash: requiredText(64),
  encryptedCNIC: { type: String, required: true, select: false }, cnicHash: { type: String, required: true, select: false, index: true },
  cnicImage: { type: assetRefSchema, required: true }, category: requiredText(150), description: requiredText(10000),
  complaintDocument: { type: assetRefSchema, required: true }, priorProceedings: { type: Boolean, required: true },
  priorProceedingsDetails: text(5000), decisionDocuments: [assetRefSchema], attachments: [assetRefSchema],
  consent: { type: consent, required: true },
  status: { type: String, enum: ['new', 'triaged', 'assigned', 'in_progress', 'needs_info', 'resolved', 'closed'], default: 'new' },
  assigneeId: oid('User'), notes: [note], history: [history],
}, options);
complaint.index({ status: 1, createdAt: -1 });
export const Complaint = mongoose.model('Complaint', complaint);
export const BoardMember = mongoose.model('BoardMember', new Schema({
  name: requiredText(150), slug: { ...requiredText(200), unique: true }, seedKey: { ...text(200), unique: true, sparse: true },
  designation: requiredText(200), slotLabel: text(200), rank: { type: Number, min: 1, required: true },
  photo: assetRefSchema, bio: localized, isActive: { type: Boolean, default: false },
}, options));
export const BlogCategory = mongoose.model('BlogCategory', new Schema({
  name: { type: localized, required: true }, slug: { ...requiredText(200), unique: true }, sortOrder: { type: Number, default: 0 }, isActive: { type: Boolean, default: true },
}, options));
// Rich text is structured blocks, never executable HTML. HTTP contracts further bound the blocks.
const block = new Schema({ type: { type: String, enum: ['paragraph', 'heading', 'list', 'image'], required: true }, text: text(10000), assetId: oid('Asset'), items: [String] }, { _id: false, strict: 'throw' });
export const BlogPost = mongoose.model('BlogPost', new Schema({
  title: { type: localized, required: true }, slug: { ...requiredText(200), unique: true }, locale: { type: String, enum: ['en', 'ur'], default: 'en' },
  translationOf: oid('BlogPost'), blocks: [block], excerpt: localized, cover: assetRefSchema, inlineAssets: [assetRefSchema],
  categories: [oid('BlogCategory')], tags: [String], authorId: oid('User'),
  status: { type: String, enum: ['draft', 'scheduled', 'published', 'archived'], default: 'draft' },
  publishedAt: Date, scheduledAt: Date, seo: localized, sourceReferences: [String], reviewStatus: review,
}, options));
export const Project = mongoose.model('Project', new Schema({
  title: { type: localized, required: true }, slug: { ...requiredText(100), unique: true }, locale: { type: String, enum: ['en', 'ur'], default: 'en' },
  summary: localized, blocks: [block], focusArea: requiredText(150), location: requiredText(150),
  projectStatus: { type: String, enum: ['Ongoing', 'Completed', 'Proposed', 'Emergency Response'], default: 'Proposed' },
  startYear: { type: Number, min: 1900, max: 2200 }, cover: assetRefSchema, sourceReferences: [String],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' }, reviewStatus: review, publishedAt: Date,
}, options));
Project.schema.index({ locale: 1, status: 1, publishedAt: -1 });
const gallery = new Schema({
  category: { type: String, enum: ['media-coverage', 'in-action'], required: true }, title: localized, alt: localized, caption: localized,
  // Source imports can prepare an unpublished draft before a reviewed file exists.
  asset: assetRefSchema, sortOrder: { type: Number, default: 0 }, publishedAt: Date,
  featured: { type: Boolean, default: false }, duplicateOf: oid('GalleryItem'), sourceImageId: text(200), sourceFilename: text(300),
  sourceImageType: { type: String, enum: ['newspaper', 'photo', 'graphic'] },
  sourceTreatment: { type: String, enum: ['STANDARD_CLEANUP', 'AI_RESTORATION'] },
  sourceWidth: { type: Number, min: 1 }, sourceHeight: { type: Number, min: 1 },
  treatment: { type: String, enum: ['ORIGINAL', 'AI_RESTORATION'], default: 'ORIGINAL' }, reviewStatus: review,
  seedKey: { ...text(200), unique: true, sparse: true },
}, options);
gallery.pre('validate', function () {
  if (this.publishedAt && (!this.asset || this.reviewStatus !== 'approved' || this.duplicateOf)) {
    this.invalidate('publishedAt', 'Publication requires a reviewed asset and a non-duplicate record.');
  }
});
export const GalleryItem = mongoose.model('GalleryItem', gallery);
export const Report = mongoose.model('Report', new Schema({
  seedKey: { ...text(200), unique: true, sparse: true },
  title: { type: localized, required: true }, slug: { ...requiredText(200), unique: true }, year: { type: Number, min: 1900, max: 2200 },
  coverageStart: Date, coverageEnd: Date, summary: localized, publicPdf: assetRefSchema, restrictedOriginal: assetRefSchema,
  cover: assetRefSchema, pages: Number, publishedAt: Date, sortOrder: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 }, releaseReview: review,
}, options));
export const Certificate = mongoose.model('Certificate', new Schema({
  seedKey: { ...text(200), unique: true, sparse: true },
  title: { type: localized, required: true }, issuer: requiredText(300), reference: text(300), issuedAt: Date, validFrom: Date, expiresAt: Date,
  original: assetRefSchema, publicFile: assetRefSchema, sortOrder: { type: Number, default: 0 }, publishedAt: Date, releaseReview: review,
}, options));
export const ContactMessage = mongoose.model('ContactMessage', new Schema({
  name: requiredText(150), email: { ...requiredText(254), lowercase: true }, phone: text(30), subject: requiredText(200), message: requiredText(5000),
  submissionKey: { ...requiredText(64), unique: true }, payloadHash: requiredText(64), consent: { type: consent, required: true },
  status: { type: String, enum: ['new', 'in_progress', 'replied', 'closed', 'spam'], default: 'new' }, assigneeId: oid('User'), notes: [note],
}, options));
export const Setting = mongoose.model('Setting', new Schema({
  key: { ...requiredText(100), unique: true }, value: { type: Schema.Types.Mixed, required: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' }, revision: { type: Number, default: 0 }, updatedBy: oid('User'),
}, options));
export const ContentPage = mongoose.model('ContentPage', new Schema({
  key: requiredText(100), locale: { type: String, enum: ['en', 'ur'], required: true }, title: requiredText(300), blocks: [block], seo: text(1000),
  provenance: [String], reviewStatus: review, publishedAt: Date, revision: { type: Number, default: 0 },
}, options).index({ key: 1, locale: 1 }, { unique: true }));
export const AuditLog = mongoose.model('AuditLog', new Schema({
  actorId: oid('User'), action: requiredText(100), entityType: requiredText(100), entityId: text(100), requestId: text(100),
  outcome: { type: String, enum: ['success', 'denied'], required: true }, changedFields: [String],
}, { timestamps: { createdAt: true, updatedAt: false }, strict: 'throw' }));
export const Asset = mongoose.model('Asset', new Schema({
  publicId: { ...requiredText(300), unique: true }, resourceType: { type: String, enum: ['image', 'raw'], required: true },
  deliveryType: { type: String, enum: ['authenticated', 'upload'], required: true }, format: requiredText(20), bytes: { type: Number, min: 1, required: true },
  width: Number, height: Number, version: Number, sha256: requiredText(64), ownerId: oid('User'), ticketHash: { type: String, select: false },
  purpose: { type: String, enum: ['complaint', 'membership', 'content', 'certificate'], required: true },
  visibility: { type: String, enum: ['public', 'restricted'], default: 'restricted' },
  scanStatus: { type: String, enum: ['clean', 'quarantined', 'infected'], default: 'quarantined' },
  claimStatus: { type: String, enum: ['staged', 'claimed', 'deleting'], default: 'staged' }, entityType: text(100), entityId: oid(''),
  stagingExpiresAt: Date,
}, options));
Asset.schema.index({ claimStatus: 1, stagingExpiresAt: 1 });
export const FormTicket = mongoose.model('FormTicket', new Schema({
  tokenHash: { type: String, required: true, unique: true, select: false },
  purpose: { type: String, enum: ['complaint', 'membership', 'contact'], required: true },
  expiresAt: { type: Date, required: true }, consumedAt: Date, submissionKey: text(64), uploadCount: { type: Number, default: 0 }, uploadBytes: { type: Number, default: 0 },
}, options).index({ expiresAt: 1 }, { expireAfterSeconds: 86400 }));
export const Counter = mongoose.model('Counter', new Schema({ key: { ...requiredText(100), unique: true }, sequence: { type: Number, default: 0, min: 0 } }, options));
// A checkpoint is committed in the same transaction as its draft. Reruns never
// recreate deleted entries or update existing content, including administrator edits.
export const SourceImport = mongoose.model('SourceImport', new Schema({
  key: { ...requiredText(200), unique: true }, manifestVersion: requiredText(50), checksum: requiredText(64),
  entityType: requiredText(100), entityId: { ...oid(''), required: true },
  references: [new Schema({ path: requiredText(500), sha256: requiredText(64), bytes: { type: Number, min: 1, required: true }, archiveEntry: text(100), width: { type: Number, min: 1 }, height: { type: Number, min: 1 } }, { _id: false, strict: 'throw' })],
  reviewTasks: [String],
}, { timestamps: { createdAt: true, updatedAt: false }, strict: 'throw' }));
export const EmailOutbox = mongoose.model('EmailOutbox', new Schema({
  dedupeKey: { ...requiredText(200), unique: true }, template: { type: String, enum: ['acknowledgement', 'admin-notification', 'password-reset'], required: true },
  entityType: requiredText(100), entityId: text(100), recipient: { ...requiredText(254), select: false },
  reference: text(100), encryptedToken: { type: String, select: false },
  status: { type: String, enum: ['pending', 'sending', 'sent', 'failed'], default: 'pending' },
  attempts: { type: Number, default: 0 }, nextAttemptAt: { type: Date, default: Date.now }, leaseUntil: Date, leaseToken: text(100),
  providerId: text(300), errorCode: text(100), sentAt: Date,
}, options).index({ status: 1, nextAttemptAt: 1 }));
BoardMember.schema.index({ isActive: 1, rank: 1 });
BlogPost.schema.index({ status: 1, reviewStatus: 1, publishedAt: -1 });
GalleryItem.schema.index({ category: 1, reviewStatus: 1, sortOrder: 1 });
Report.schema.index({ releaseReview: 1, publishedAt: -1 });
Certificate.schema.index({ releaseReview: 1, publishedAt: -1 });
ContactMessage.schema.index({ status: 1, createdAt: -1 });
AuditLog.schema.index({ entityType: 1, entityId: 1, createdAt: -1 });
export async function ensureIndexes() {
  // Additive createIndexes only; never drop existing production indexes.
  for (const model of Object.values(mongoose.models)) await model.createIndexes();
}
