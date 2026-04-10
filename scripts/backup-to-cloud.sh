#!/bin/bash

# Optional: Upload backups to cloud storage
# Supports: AWS S3, Google Cloud Storage, Dropbox
# Usage: ./scripts/backup-to-cloud.sh [provider]

# Note: we do NOT use set -e here so that the if/$? checks below can run

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROVIDER=${1:-"s3"} # Default to AWS S3
BACKUP_DIR="backups"

echo -e "${YELLOW}☁️  Uploading backups to cloud storage ($PROVIDER)...${NC}"

# Get latest backup
LATEST_BACKUP=$(ls -t $BACKUP_DIR/somovibe_backup_*.sql.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}❌ No backups found to upload${NC}"
    exit 1
fi

echo -e "${YELLOW}📄 Uploading: $(basename $LATEST_BACKUP)${NC}"

case $PROVIDER in
    "s3"|"aws")
        # AWS S3
        # Requires: aws-cli installed and configured
        # Install: apt-get install awscli
        # Configure: aws configure
        
        if ! command -v aws &> /dev/null; then
            echo -e "${RED}❌ AWS CLI not installed${NC}"
            echo -e "${YELLOW}Install: apt-get install awscli${NC}"
            exit 1
        fi
        
        # Set your S3 bucket name
        S3_BUCKET=${S3_BUCKET:-"somovibe-backups"}
        
        aws s3 cp "$LATEST_BACKUP" "s3://$S3_BUCKET/database-backups/$(basename $LATEST_BACKUP)"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN} Uploaded to S3: s3://$S3_BUCKET/database-backups/$(basename $LATEST_BACKUP)${NC}"
        else
            echo -e "${RED}❌ Upload to S3 failed${NC}"
            exit 1
        fi
        ;;
        
    "gcs"|"google")
        # Google Cloud Storage
        # Requires: gsutil installed and configured
        # Install: curl https://sdk.cloud.google.com | bash
        # Configure: gcloud init
        
        if ! command -v gsutil &> /dev/null; then
            echo -e "${RED}❌ gsutil not installed${NC}"
            echo -e "${YELLOW}Install: curl https://sdk.cloud.google.com | bash${NC}"
            exit 1
        fi
        
        # Set your GCS bucket name
        GCS_BUCKET=${GCS_BUCKET:-"somovibe-backups"}
        
        gsutil cp "$LATEST_BACKUP" "gs://$GCS_BUCKET/database-backups/$(basename $LATEST_BACKUP)"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN} Uploaded to GCS: gs://$GCS_BUCKET/database-backups/$(basename $LATEST_BACKUP)${NC}"
        else
            echo -e "${RED}❌ Upload to GCS failed${NC}"
            exit 1
        fi
        ;;
        
    "dropbox")
        # Dropbox
        # Requires: dropbox-uploader installed
        # Install: curl "https://raw.githubusercontent.com/andreafabrizi/Dropbox-Uploader/master/dropbox_uploader.sh" -o dropbox_uploader.sh
        # Configure: ./dropbox_uploader.sh
        
        if [ ! -f "dropbox_uploader.sh" ]; then
            echo -e "${RED}❌ dropbox_uploader.sh not found${NC}"
            echo -e "${YELLOW}Install: curl 'https://raw.githubusercontent.com/andreafabrizi/Dropbox-Uploader/master/dropbox_uploader.sh' -o dropbox_uploader.sh${NC}"
            exit 1
        fi
        
        ./dropbox_uploader.sh upload "$LATEST_BACKUP" "/somovibe-backups/$(basename $LATEST_BACKUP)"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN} Uploaded to Dropbox: /somovibe-backups/$(basename $LATEST_BACKUP)${NC}"
        else
            echo -e "${RED}❌ Upload to Dropbox failed${NC}"
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Unknown provider: $PROVIDER${NC}"
        echo -e "${YELLOW}Supported providers: s3, gcs, dropbox${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN} Cloud backup complete!${NC}"
