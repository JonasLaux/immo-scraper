#!/bin/bash

gcloud functions deploy scrape \
     --project= \
     --runtime nodejs18 \
     --trigger-topic=TriggerScrape \
     --entry-point scrape \
     --source . \
     --region europe-west3 \
     --gen2 \
     --env-vars-file .env.yaml \
     --memory=256Mi
