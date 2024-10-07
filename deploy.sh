#!/bin/bash

gcloud functions deploy scrape \
     --project= \
     --runtime nodejs18 \
     --trigger-http \
     --allow-unauthenticated \
     --entry-point scrape \
     --source . \
     --region europe-west3 \
     --gen2 \
     --env-vars-file .env.yaml \
     --memory=1024Mb
