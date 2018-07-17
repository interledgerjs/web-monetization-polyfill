#!/bin/bash

# should be /
aws s3 cp dist/index.js s3://polyfill.webmonetization.org/polyfill.js
aws s3 cp static/signin.css s3://polyfill.webmonetization.org/signin.css
aws s3 cp dist/register.js s3://polyfill.webmonetization.org/register.js

# should be /register
aws s3 cp static/register.html s3://polyfill.webmonetization.org/register.html
aws s3 cp dist/iframe.js s3://polyfill.webmonetization.org/iframe.js

# should be /stream
aws s3 cp dist/stream.js s3://polyfill.webmonetization.org/stream.js

# should be /iframe
aws s3 cp static/iframe.html s3://polyfill.webmonetization.org/iframe.html
