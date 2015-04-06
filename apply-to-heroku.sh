#!/bin/bash

if [ -z "$1" ]; then
	echo "error: commit message required..."
	exit 1;
fi

git commit -am "$1"
git push heroku master
