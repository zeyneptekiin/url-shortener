#!/bin/bash
set -e

/entrypoint.sh couchbase-server &

sleep 60

if [ -z "$COUCHBASE_ADMINISTRATOR_USERNAME" ] || [ -z "$COUCHBASE_ADMINISTRATOR_PASSWORD" ]; then
  echo "Error: COUCHBASE_ADMINISTRATOR_USERNAME and COUCHBASE_ADMINISTRATOR_PASSWORD must be set"
  exit 1
fi

if ! /opt/couchbase/bin/couchbase-cli cluster-info -c couchbase:8091 -u $COUCHBASE_ADMINISTRATOR_USERNAME -p $COUCHBASE_ADMINISTRATOR_PASSWORD > /dev/null 2>&1; then
    echo "Initializing Couchbase cluster..."

    /opt/couchbase/bin/couchbase-cli cluster-init \
        -c couchbase:8091 \
        --cluster-username $COUCHBASE_ADMINISTRATOR_USERNAME \
        --cluster-password $COUCHBASE_ADMINISTRATOR_PASSWORD \
        --cluster-port 8091 \
        --cluster-ramsize $COUCHBASE_BUCKET_RAMSIZE \
        --cluster-index-ramsize $COUCHBASE_INDEX_RAM_SIZE \
        --cluster-name $CLUSTER_NAME \
        --services data,index,query
else
    echo "Cluster is already initialized, skipping initialization."
fi

if ! /opt/couchbase/bin/couchbase-cli bucket-list -c couchbase:8091 -u $COUCHBASE_ADMINISTRATOR_USERNAME -p $COUCHBASE_ADMINISTRATOR_PASSWORD | grep -q $COUCHBASE_BUCKET; then
    echo "Creating bucket '$COUCHBASE_BUCKET'..."
    /opt/couchbase/bin/couchbase-cli bucket-create \
        -c couchbase:8091 \
        --bucket $COUCHBASE_BUCKET \
        --bucket-type $COUCHBASE_BUCKET_TYPE \
        --bucket-ramsize $COUCHBASE_BUCKET_RAMSIZE \
        -u $COUCHBASE_ADMINISTRATOR_USERNAME \
        -p $COUCHBASE_ADMINISTRATOR_PASSWORD
else
    echo "Bucket '$COUCHBASE_BUCKET' already exists."
fi

echo "Checking the status of services..."
/opt/couchbase/bin/couchbase-cli server-list -c couchbase:8091 -u $COUCHBASE_ADMINISTRATOR_USERNAME -p $COUCHBASE_ADMINISTRATOR_PASSWORD

wait
