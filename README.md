# action-vpat-publish

Publish the most recent VPAT in a repository to the product-docs site.

## Example workflow

The following workflow will convert the most recent VPAT report in the `vpats` directory to HTML, and then create a pull request that submits it to the docs-site repository.

```yaml
name: Publish VPAT

on:
  push:
    branches:
      - main
    paths:
      - 'vpats/*'

jobs:
  publish-vpat:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: dequelabs/action-vpat-upload@main
        with:
          docs-site-github-token: ${{ secrets.DOCS_SITE_GITHUB_TOKEN }}
          docs-site-repository: 'dequelabs/<docs_site_repo>'
          product-name: 'My Product'
          product-id: 'my-product'
          vpat-location: vpats
```

## Inputs

| Name | Description | Default |
| --- | --- | --- |
`docs-site-github-token` | GitHub token to access the docs-site repository. |
`docs-site-repository` | GitHub repository containing the docs-site. |
`product-name` | Human-readable product name. Used to generate a title for the generated HTML document. |
`product-id` | Brief token that identifies your product. This should match the product ID used by the docs site. |
`vpat-location` | Directory from which the most recent VPAT with be sourced. VPATs are expected to be in markdown format. | `vpats`

## Developer notes

* The compiled `dist/` directory is committed to the `main` branch by running `npm run build` locally and committing the changes. The pre-commit hook should do this for you.
* Since this action's test workflow creates a pull request, it is not configured to run automatically. To test this action, push a branch with your changes to GitHub, then trigger the `Test` workflow manually from the Actions view. You can then check the pull request that is created to see if the action worked as expected.
