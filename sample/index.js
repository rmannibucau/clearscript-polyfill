//
// assuming you impl XMLHttpRequest (with HttpClient), setInterval/setTimeout with Timer, you can use this entrypoint
//
import '../dist/polyfills.bundle';

(async () => {
  try {
    const { S3Client, ListBucketsCommand } = await import('@aws-sdk/client-s3');
    ScriptResult = {
      success: true,
      result: await new S3Client({
        region: process.env.region || 'us-east-1',
        credentials: {
          accessKeyId: process.env.accessKeyId,
          secretAccessKey: process.env.secretAccessKey,
          sessionToken: process.env.sessionToken,
        },
      }).send(
        new ListBucketsCommand({
          MaxBuckets: 100,
        }),
      ),
    };
  } catch (err) {
    ScriptResult = {
      success: false,
      error: err.stack ? err.stack : err,
    };
  }
})();
