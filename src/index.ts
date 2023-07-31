import * as core from '@actions/core'
import * as fs from 'fs'
import { marked } from 'marked'
import { mangle } from 'marked-mangle'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import styles from './styles'

main().catch((err: Error) => {
  core.setFailed(err.message)
})

/**
 * Upload the most recent VPAT to an S3 bucket.
 */

async function main() {
  // Convert most recent VPAT to HTML
  const vpatLocation = core.getInput('vpat-location')
  const mostRecentVpat = getMostRecentVpat(vpatLocation)
  const vpatMarkdown = fs.readFileSync(mostRecentVpat, 'utf-8')
  const htmlContent = generateHTMLWithStylesheet(vpatMarkdown, styles)
  
  // Validate AWS credentials
  const accessKeyId = core.getInput('aws-access-key-id')
  const secretAccessKey = core.getInput('aws-secret-access-key')
  const region = core.getInput('aws-region')
  const bucket = core.getInput('aws-bucket')

  if (!accessKeyId) {
    throw new Error('Missing AWS Access Key ID')
  }

  if (!secretAccessKey) {
    throw new Error('Missing AWS Secret Access Key')
  }

  if (!region) {
    throw new Error('Missing AWS Region')
  }

  if (!bucket) {
    throw new Error('Missing AWS Bucket')
  }

  // Create S3 client instance
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  // Upload to S3
  try {
    const filename = createFilename()
    core.info(`Uploading '${mostRecentVpat}' to S3 bucket '${bucket}' as '${filename}'`)
    const params = {
      Bucket: bucket,
      Key: filename,
      Body: htmlContent,
    }
    const command = new PutObjectCommand(params)
    await s3Client.send(command)
    core.info(`File uploaded successfully`)
  } catch (err) {
    throw err
  }
}

/**
 * Get the most recent VPAT from a given directory.
 * The most recent VPAT is determined by the file's creation date.
 * 
 * @param location Directory containing VPATs in markdown format.
 * @returns Relative path to the most recent VPAT file.
 */

function getMostRecentVpat(location: string): string {
  if (fs.lstatSync(location).isDirectory() === false) {
    throw new Error('VPAT location is not a directory')
  }

  const files = fs.readdirSync(location)

  if (files.length <= 0) {
    throw new Error('VPAT location contains no files')
  }

  const sorted = files.sort((a, b) => {
    const aCreated = fs.statSync(`${location}/${a}`).birthtimeMs
    const bCreated = fs.statSync(`${location}/${b}`).birthtimeMs
    return aCreated - bCreated
  })

  return `${location}/${sorted[sorted.length - 1]}`
}

/**
 * Read the contents of a stylesheet.
 * 
 * @param stylesheetLocation Relative path to stylesheet.
 * @returns Contents of the stylesheet.
 */

function readStylesheet(stylesheetLocation: string): string {
  if (fs.lstatSync(stylesheetLocation).isFile() === false) {
    throw new Error('Stylesheet location is not a file')
  }

  return fs.readFileSync(stylesheetLocation, 'utf8')
}

/**
 * Generate HTML content with a stylesheet.
 * 
 * @param markdownContent Markdown content to convert to HTML.
 * @param stylesheetContent Contents of the stylesheet.
 * @returns HTML content with stylesheet.
 */

function generateHTMLWithStylesheet(
  markdownContent: string,
  stylesheetContent: string
) {
  const productName = core.getInput('product-name')

  if (!productName) {
    throw new Error('Missing product name')
  }

  marked.use(mangle())
  marked.use(gfmHeadingId())
  const htmlContent = marked.parse(markdownContent)
  const htmlWithStylesheet = `
    <html>
      <head>
        <title>VPAT for ${productName}</title>
        <style>
          ${stylesheetContent}
        </style>
      </head>
      <body class="markdown-body">
        ${htmlContent}
      </body>
    </html>
  `
  return htmlWithStylesheet
}

/**
 * Create a filename for the VPAT HTML file.
 * The filename is based on the product ID.
 * 
 * @returns Filename for the VPAT HTML file.
 */

function createFilename() {
  const productId = core.getInput('product-id')

  if (!productId) {
    throw new Error('Missing product ID')
  }

  return `${productId}.html`
}
