all:: clean browser node

.PHONY:: clean base mockDocs specs browser node package all travis-ci

DIST=docs/dist

travis-ci:: all
ifneq ("$(shell git status --porcelain)","")
	@echo "This test fails because the build process changed some files that haven't been committed yet."
	@exit 1;
endif

SOURCE_FILES = \
	source/moduleUtilities.js \
	source/ProxyMapping.js \
	source/Membrane.js \
	source/ObjectGraphHandler.js \
	source/ProxyNotify.js \
	source/ModifyRulesAPI.js \
	source/dogfood.js \
	$(NULL)

base::
	@mkdir -p $(DIST)/staging
	@cp source/sharedUtilities.js $(DIST)/staging/sharedUtilities.js
	@cat $(SOURCE_FILES) > $(DIST)/staging/es7-membrane.js

MOCKS_FILES = \
	mocks/logger.js \
	mocks/dampSymbol.js \
	mocks/intro.js.in \
	mocks/wetDocument.js \
	mocks/membrane.js \
	mocks/dryDocument.js \
	mocks/dampObjectGraph.js \
	mocks/return.js \
	mocks/outro.js.in \
	$(NULL)

mockDocs::
	@mkdir -p $(DIST)/staging
	@cat $(MOCKS_FILES) > $(DIST)/staging/mocks.js

OVERRIDE_FILES = \
	spec/overrides/empty.js \
	$(NULL)

USE_CASE_FILES = \
	spec/useCases/sampleUseCase.js \
	$(NULL)

specs::
	@mkdir -p $(DIST)/staging
	@cat $(OVERRIDE_FILES) > $(DIST)/staging/specs-overrides.js
	@cat $(USE_CASE_FILES) > $(DIST)/staging/specs-use-cases.js

clean::
	@rm -rf dist

BROWSER_MEMBRANE_FILES = \
  wrappers/browser/membrane-intro.js.in \
  wrappers/useStrict.js \
  $(DIST)/staging/es7-membrane.js \
  wrappers/browser/membrane-outro.js.in \
  $(NULL)

browser:: base mockDocs specs
	@mkdir -p $(DIST)/browser
	@cp wrappers/browser/test-browser.xhtml $(DIST)/browser/test-browser.xhtml
	@cat $(BROWSER_MEMBRANE_FILES) > $(DIST)/browser/es7-membrane.js
	@cat wrappers/useStrict.js $(DIST)/staging/sharedUtilities.js > $(DIST)/browser/sharedUtilities.js
	@cat wrappers/useStrict.js $(DIST)/staging/mocks.js > $(DIST)/browser/mocks.js
	@cp wrappers/browser/assert.js $(DIST)/browser/assert.js
	@echo "You may now open './$(DIST)/staging/test-browser.xhtml'."
	@echo "  (if Mozilla Firefox, version 51 or later is required)"

NODE_DIST_FILES = \
	wrappers/useStrict.js \
	wrappers/node/require-assert.js \
	wrappers/node/require-utilities.js \
	$(DIST)/staging/es7-membrane.js \
	wrappers/node/export-membrane.js \
	$(NULL)

NODE_MOCKS_FILES = \
	wrappers/useStrict.js \
	wrappers/node/require-assert.js \
	wrappers/node/require-utilities.js \
	wrappers/node/require-membrane.js \
	$(DIST)/staging/mocks.js \
	wrappers/node/export-mocks.js \
	$(NULL)

NODE_UTILITIES_FILES = \
	wrappers/useStrict.js \
	$(DIST)/staging/sharedUtilities.js \
	wrappers/node/export-utilities.js \
	$(NULL)

node:: base mockDocs specs
	@mkdir -p $(DIST)/node
	@cat $(NODE_DIST_FILES) > $(DIST)/node/es7-membrane.js
	@cat $(NODE_MOCKS_FILES) > $(DIST)/node/mocks.js
	@cat $(NODE_UTILITIES_FILES) > $(DIST)/node/utilities.js
	@npm test
