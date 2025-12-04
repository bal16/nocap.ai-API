# MinIO Quickstart Guide

This guide will walk you through accessing the MinIO service defined in your `docker-compose.yml`, creating your first bucket, and uploading a file using its web interface.

## 1. Accessing the MinIO Web Interface (Console)

MinIO comes with a user-friendly web console for managing your object storage.

- **URL:** Open your web browser and navigate to http://localhost:9001
- **Username:** `minioadmin`
- **Password:** `minioadmin`

These credentials are the `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` values set in your `docker-compose.yml` file.

## 2. How to Create a Bucket

Buckets are like top-level folders where you store your objects (files). All objects in MinIO must reside in a bucket.

1. After logging in, you will see the main dashboard.
2. Click the **"Create Bucket"** button, usually located on the right side of the screen.
3. A dialog box will appear. Enter a name for your bucket (e.g., `my-first-bucket`). Bucket names must be unique, lowercase, and follow DNS naming conventions.
4. You can leave the other options (like Versioning and Object Locking) as default for now.
5. Click the **"Create Bucket"** button to finalize.

You will now see your new bucket listed on the Buckets page.

## 3. How to Use MinIO (Upload & Manage Files)

Now that you have a bucket, you can start adding files to it.

1. Click on the name of the bucket you just created (e.g., `my-first-bucket`) to navigate into it.
2. Click the **"Upload"** button, which is typically a cloud icon with an upward arrow.
3. You can choose to upload a file or an entire folder. Select **"Upload file"**.
4. A file browser will open. Select a file from your local machine and click "Open".
5. The file will be uploaded, and you will see it listed inside your bucket.

From here, you can click on the file to see its details, generate a shareable link, or download it.

## 4. Programmatic Access (Using SDKs)

While the web interface is great for manual management, the real power of MinIO comes from programmatic access. MinIO is compatible with the Amazon S3 API, which means you can use any S3-compatible SDK to interact with it.

Here are the connection details you would use in your application's configuration:

- **Endpoint:** `http://localhost:9000` (This is the API port, not the console port)
- **Access Key ID:** `minioadmin`
- **Secret Access Key:** `minioadmin`
- **Region:** You can typically use any string, like `us-east-1`.

This allows your backend application to programmatically upload, download, and manage files, which is the most common use case.
