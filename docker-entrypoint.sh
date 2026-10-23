#!/bin/sh
set -eu
CERT_FILE=/etc/secrets/ca.pem
TRUSTSTORE=/tmp/aiven-truststore.p12
if [ ! -r "$CERT_FILE" ]; then
    echo "Falta el certificado CA de Aiven: agrega el Secret File ca.pem en Render." >&2
    exit 1
fi
rm -f "$TRUSTSTORE"
keytool -importcert -noprompt -alias aiven-ca -file "$CERT_FILE"     -keystore "$TRUSTSTORE" -storetype PKCS12 -storepass changeit
exec java -jar /app/taller.jar
