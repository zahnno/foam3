#!/bin/bash

IN_FILE=
INSTANCES=
OUT_FILE=
EXTRA_FILES=

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -I : Input File, no option defaults to stdin"
    echo "  -J : Instances"
    echo "  -O : Output File, no option defaults to stdout"
    echo "  -E : Specify extra journal source directory"
}

while getopts "I:J:O:E:" opt ; do
    case $opt in
        I) IN_FILE=$OPTARG ;;
        J) INSTANCES=$OPTARG ;;
        O) OUT_FILE=$OPTARG ;;
        E) EXTRA_FILES=$OPTARG ;;
        ?) usage ; exit 1;;
    esac
done

declare -a sources=(
  "foam2/src"
  "nanopay/src"
)

IFS=',' read -ra DIRS <<< "$INSTANCES"
for d in "${DIRS[@]}"; do
    sources+=("deployment/$(echo "$d" | tr '[:upper:]' '[:lower:]')")
done

if [ ! -z $EXTRA_FILES ]; then
    sources+=($EXTRA_FILES)
fi

if [ ! -z $OUT_FILE ]; then
    rm $OUT_FILE
fi

sed 's/#.*//;s/^[[:space:]]*//;s/[[:space:]]*$//' < "${IN_FILE:-/dev/stdin}" | while read -r file; do
    if [ ! -z $file ]; then
        find ${sources[@]} -type f \( -name "${file}" -o -name "${file}.jrl" \) >> "${OUT_FILE:-/dev/stdout}"
    fi
done

exit 0
