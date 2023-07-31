# action-vpat-upload

Upload the most recent VPAT in a repository to an S3 bucket.

## Example workflow

The following workflow will upload the most recent VPAT in the `vpats` directory to the `deque-vpats` S3 bucket. The VPAT will be named `my-product.html`.

```yaml
name: Upload VPAT

on:
  push:
    branches:
      - main
    paths:
      - 'vpats/*'

jobs:
  upload-vpat:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: dequelabs/action-vpat-upload@main
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: 'us-east-1'
          aws-bucket: 'deque-vpats'
          product-name: 'My Product'
          product-id: 'my-product'
          vpat-location: vpats
```

## Inputs

| Name | Description | Default |
| --- | --- | --- |
`aws-access-key-id` | AWS access key ID. |
`aws-secret-access-key` | AWS secret access key. |
`aws-region` | Region of target AWS bucket. |
`aws-bucket` | Name of target AWS bucket. |
`product-name` | Name of the product. Human-readable. Used to generate a title for the generated HTML document. |
`product-id` | ID for the product. A brief token with no spaces. Used to name the object that is uploaded to S3. |
`vpat-location` | Directory from which the most recent VPAT with be sourced. VPATs are expected to be in markdown format. | `vpats`

## Developer notes

* The compiled `dist/` directory is committed to the `main` branch by running `npm run build` locally and committing the changes. The pre-commit hook should do this for you.
* Commits to any branch will trigger the `Test` workflow, which uploads an example VPAT file to S3. Download the file from S3 and verify that the product name includes "(Created Last)".
