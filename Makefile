version=$(shell cat package.json | jq -r .version)

.PHONY: build
build:
	npm run build

.PHONY: publish
publish: build
	npm publish --access public

.PHONY: tag
tag:
	git tag $(version)

.PHONY: new-patch
new-patch:
	npm version patch

.PHONY: release
release: new-patch build publish
	echo "Released version $(cat package.json | jq -r .version)"