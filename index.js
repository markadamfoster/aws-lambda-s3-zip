const AWS = require("aws-sdk");
const s3Zip = require("s3-zip");
const axios = require("axios").default;

exports.handler = function (event, _context, callback) {
  console.log("🚀 event:", event);

  const region = event.region; // 'us-east-1'
  const bucket = event.bucket; // 'photoinvoice-dev'
  const folder = event.folder; // 'invoice-photos/5dd80799fdf53b0735e61b61/5e7b4c8e04a53ce79486f04e/xrd7YoMh2WaXlk81U'
  const files = event.files; // [ '959TecumsahLane04.jpg', '959TecumsahLane05.jpg' ]
  const zipFolderAndFileName = event.zipFolderAndFileName; // 'zip/5e7b4c8e04a53ce79486f04e/xrd7YoMh2WaXlk81U/Photos.zip'
  const downloadClientId = event.downloadClientId; // 'clbuBa8L04S2aHl2i'
  const invoiceId = event.invoiceId;
  const deliverableId = event.deliverableId;
  const responseAPIUrl = event.responseAPIUrl; // '${process.env.API_URL}/s3ZipperComplete'

  try {
    const body = s3Zip.archive(
      { region: region, bucket: bucket },
      folder,
      files
    );
    const zipParams = {
      params: {
        ACL: "public-read",
        ContentType: "application/zip",
        ContentDisposition: "attachment",
        Bucket: bucket,
        Key: zipFolderAndFileName,
      },
    };
    const zipFile = new AWS.S3(zipParams);

    zipFile
      .upload({ Body: body })
      .on("httpUploadProgress", function (evt) {
        console.log("⏫ upload evt:", evt);
      })
      .send(function (e, r) {
        if (e) {
          const err = "🚨 zipFile.upload error " + e;
          console.log(err);

          axios
            .post(responseAPIUrl, {
              status: "error",
              downloadClientId,
              error: err,
            })
            .then((res) =>
              console.log("🚨👍 axios zip upload catch block POST res:", res)
            )
            .catch((err) =>
              console.log("🚨👎 axios zip upload catch block error:", err)
            );

          callback();
        }
        console.log("👌 r:", r);

        if (r) {
          // Send Success notice to the ExpressJS API
          axios
            .post(responseAPIUrl, {
              status: "success",
              zipUrl: r.Location,
              downloadClientId,
              invoiceId,
              deliverableId,
            })
            .then((res) => console.log("👍 axios POST res:", res))
            .catch((err) => console.log("👎 axios POST error:", err));

          console.log("✅ after the axios success POST command");
        }

        callback();
      });
  } catch (e) {
    const err = "🚨 catch block error: " + e;
    console.log(err);

    // Send Error notice to the ExpressJS API
    axios
      .post(responseAPIUrl, {
        status: "error",
        downloadClientId,
        error: err,
      })
      .then((res) => console.log("🚨👍 axios catch block POST res:", res))
      .catch((err) => console.log("🚨👎 axios catch block POST error:", err));

    console.log("✅ after the catch block axios POST command");

    callback();
  }
};
