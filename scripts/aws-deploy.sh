#!/bin/bash

# should be /
aws s3 cp dist/index.js s3://web-monetization/polyfill.js
aws s3 cp static/signin.css s3://web-monetization/signin.css
aws s3 cp dist/register.js s3://web-monetization/register.js

# should be /register
aws s3 cp static/register.html s3://web-monetization/register.html
aws s3 cp dist/iframe.js s3://web-monetization/iframe.js

# should be /stream
aws s3 cp dist/stream.js s3://web-monetization/stream.js

# should be /iframe
aws s3 cp static/iframe.html s3://web-monetization/iframe.html
