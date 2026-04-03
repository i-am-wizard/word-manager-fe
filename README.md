# word-manager-fe

## Deploy to S3

```bash
cd vite-frontend
npm ci
npm run build
aws s3 sync ./dist s3://<bucket-name> --delete
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```
