# YouTube gallery videos

The approved list contains 28 unique YouTube IDs: 5 TV Interviews and 23 Media Coverage videos. Duplicate source links (9/18 and 13/29) occur only once. Original YouTube titles, channel names and thumbnails are fetched from YouTube oEmbed at import; the source filenames are not website captions.

```sh
cd backend
npm run seed:videos
npm run seed:videos -- --database
npm run seed:videos -- --apply
```

The first command verifies the manifest offline. `--database` is a read-only plan. `--apply` creates and publishes missing videos with an audit record, without uploading any video or image to Cloudinary. It requires the existing private `backend/.env` MongoDB configuration and `SEED_ACTOR_EMAIL` for an active administrator. Like the other development seeds, use `NODE_ENV=development`, the development database and `CLOUDINARY_NAMESPACE=hrpf/dev`. No YouTube API key or Cloudinary credentials are needed for this seed.

Unavailable metadata produces a failed entry and a nonzero exit code. Rerun after correcting availability/connectivity. Existing URLs and seed keys are preserved, including admin changes, hidden records, page assignments and ordering. The seed does not republish hidden videos.

Admin → Gallery → Videos: paste a public YouTube link, choose the website page, optionally load its information to preview it, set display order (lower first), then save a draft or review and publish. Editing returns a published record to draft until republished. Hide withdraws it. Duplicate normalized URLs are rejected. YouTube titles and thumbnails are snapshots fetched on every save; they are not manually replaced by website captions. The public title retains YouTube's original wording in either website language. Legacy Vimeo records still support their existing manual title/thumbnail workflow.

Media Coverage keeps the Press coverage and HRPF photographs tabs, and adds a Videos tab at `/gallery/media-coverage?category=videos`. TV Interviews shows only its assigned videos. Neither page mounts video iframes before Play is clicked. The player uses the provider's own playback controls. Card titles are limited to two lines with an ellipsis; the full title remains available to assistive technology and on hover. Embedding remains subject to the video's YouTube availability and uploader settings.
