all:: clean browser node

.PHONY:: clean base mockDocs specs browser node package all travis-ci

travis-ci::
ifneq ("$(shell git status --porcelain)","")
	@echo "This test fails because the build process changed some files that haven't been committed yet."
	@exit 1;
endif

SOURCE_FILES = \
	source/moduleUtilities.js \
	source/ProxyMapping.js \
	source/Membrane.js \
	source/ObjectGraphHandler.js \
	source/ModifyRulesAPI.js \
	source/dogfood.js \
	$(NULL)

base::
	@mkdir -p dist/staging
	@cp source/sharedUtilities.js dist/staging/sharedUtilities.js
	@cat $(SOURCE_FILES) > dist/staging/es7-membrane.js

MOCKS_FILES = \
	mocks/intro.js.in \
	mocks/wetDocument.js \
	mocks/membrane.js \
	mocks/dryDocument.js \
	mocks/dampObjectGraph.js \
	mocks/return.js \
	mocks/outro.js.in \
	$(NULL)

mockDocs::
	@mkdir -p dist/staging
	@cat $(MOCKS_FILES) > dist/staging/mocks.js

OVERRIDE_FILES = \
	spec/overrides/empty.js \
	$(NULL)

USE_CASE_FILES = \
	spec/useCases/sampleUseCase.js \
	$(NULL)

specs::
	@mkdir -p dist/staging
	@cat $(OVERRIDE_FILES) > dist/staging/specs-overrides.js
	@cat $(USE_CASE_FILES) > dist/staging/specs-use-cases.js

clean::
	@rm -rf dist

browser:: base mockDocs specs
	@mkdir -p dist/browser
	@cp wrappers/browser/test-browser.xhtml dist/browser/test-browser.xhtml
	@cp dist/staging/es7-membrane.js dist/browser/es7-membrane.js
	@cp dist/staging/sharedUtilities.js dist/browser/sharedUtilities.js
	@cp dist/staging/mocks.js dist/browser/mocks.js
	@cp wrappers/browser/assert.js dist/browser/assert.js
	@echo "You may now open './dist/staging/test-browser.xhtml'."
	@echo "  (if Mozilla Firefox, version 51 or later is required)"

NODE_DIST_FILES = \
	wrappers/node/require-assert.js \
	wrappers/node/require-utilities.js \
	dist/staging/es7-membrane.js \
	wrappers/node/export-membrane.js \
	$(NULL)

NODE_MOCKS_FILES = \
	wrappers/node/require-assert.js \
	wrappers/node/require-utilities.js \
	wrappers/node/require-membrane.js \
	dist/staging/mocks.js \
	wrappers/node/export-mocks.js \
	$(NULL)

NODE_UTILITIES_FILES = \
	dist/staging/sharedUtilities.js \
	wrappers/node/export-utilities.js \
	$(NULL)

node:: base mockDocs specs
	@mkdir -p dist/node
	@cat $(NODE_DIST_FILES) > dist/node/es7-membrane.js
	@cat $(NODE_MOCKS_FILES) > dist/node/mocks.js
	@cat $(NODE_UTILITIES_FILES) > dist/node/utilities.js
	@npm test
