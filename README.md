# AWS Lambda s3-zip

An AWS Lambda function (currently being used for my Photo Invoice project. You pass it a list of files (along with region/bucket/folder info), and it creates a zip of the files, which is placed back on s3 to a location of your choosing.

After the zip is uploaded (or if there's an error), it hits an endpoint with the success/error message. I use this to then send a socket message to the client to start the zip file download.

The heavy lifting is done by the [s3-zip](https://github.com/orangewise/s3-zip) library.

## Setup

### Local Setup
1. Clone this repo
2. `npm install` to install dependencies

### AWS Setup
1. Create a new Lambda function
2. Use an IAM role that has access to the s3 bucket(s) you'll be using
3. Increase the memory/timeout settings depending on your needs
4. Create a .zip file of `index.js` and `node_modules`. Upload this zip as the function code.

## Making & Testing Changes
Currently there's no way to test things locally. Instead, set up two different Lambda functions, one for dev and one for production. After making changes, create a new zip file of `index.js` and `node_modules`. Upload this zip to the dev function for testing. To deploy, upload the zip to the production function.