.PHONY:: clean base mockDocs specs browser-test chrome-test package

SOURCE_FILES = \
	source/utilities.js \
	source/ProxyMapping.js \
	source/Membrane.js \
	source/ObjectGraphHandler.js \
	$(NULL)

base::
	@mkdir -p dist/staging
	@cat $(SOURCE_FILES) > dist/staging/es7-membrane.js

MOCKS_FILES = \
	mocks/intro.js.in \
	mocks/wetDocument.js \
	mocks/membrane.js \
	mocks/dryDocument.js \
	mocks/outro.js.in \
	$(NULL)

mockDocs::
	@mkdir -p dist/staging
	@cat $(MOCKS_FILES) > dist/staging/mocks.js

OVERRIDE_FILES = \
	spec/overrides/empty.js \
	$(NULL)

USE_CASE_FILES = \
	spec/useCases/empty.js \
	$(NULL)

specs::
	@mkdir -p dist/staging
	@cat $(OVERRIDE_FILES) > dist/staging/specs-overrides.js
	@cat $(USE_CASE_FILES) > dist/staging/specs-use-cases.js

clean::
	@rm -rf dist/staging

browser-test:: base mockDocs specs
	@cp wrappers/test-browser.xhtml dist/staging/test-browser.xhtml
	@cp wrappers/assert.js dist/staging/assert.js
	@echo "You may now open './dist/staging/test-browser.xhtml'."
	@echo "  (if Mozilla Firefox, version 51 or later is required)"
