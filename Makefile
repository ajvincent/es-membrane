all:: clean node browser node-tests gui-tests

.PHONY:: clean base mockDocs specs browser node package all travis-ci node-tests gui-tests

DIST=docs/dist

travis-ci:: all
ifneq ("$(shell git status --porcelain)","")
	@echo "This test fails because the build process changed some files that haven't been committed yet."
	@exit 1;
endif

SOURCE_DOGFOOD_FILES = \
	source/dogfood/intro.js.in \
	source/dogfood/build-membrane.js \
	source/dogfood/outro.js.in \
	$(NULL)

SOURCE_HANDLER_FILES = \
	source/ProxyHandlers/intro.js \
	source/ProxyHandlers/Base.js \
	source/ProxyHandlers/Forwarding.js \
	$(NULL)

SOURCE_FILES = \
	source/sharedUtilities.js \
	source/moduleUtilities.js \
	source/ProxyMapping.js \
	source/Membrane.js \
	source/ObjectGraphHandler.js \
	source/ProxyNotify.js \
	source/ModifyRulesAPI.js \
	source/DistortionsListener.js \
	$(SOURCE_DOGFOOD_FILES) \
	$(NULL)

base::
	@mkdir -p $(DIST)/staging
	@cp source/sharedUtilities.js $(DIST)/staging/sharedUtilities.js
	@cp source/DimensionalMap.js $(DIST)/staging/DimensionalMap.js
	@cat $(SOURCE_DOGFOOD_FILES) > $(DIST)/staging/dogfood.js
	@cat $(SOURCE_HANDLER_FILES) > $(DIST)/staging/proxyHandlers.js
	@cat $(SOURCE_FILES) > $(DIST)/staging/es-membrane.js

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

# When you update this, update wrappers/browser/debug-browser.xhtml as well.
ALL_SPEC_FILES = \
	spec/non-membrane/logger.js \
	spec/non-membrane/defineProperty.js \
	spec/non-membrane/deleteProperty.js \
	spec/non-membrane/filterOwnKeys.js \
	spec/non-membrane/freeze-seal.js \
	spec/non-membrane/prototypes.js \
	spec/non-membrane/lazyGetter.js \
	spec/non-membrane/argumentTruncation.js \
	spec/non-membrane/receiver.js \
	spec/non-membrane/instanceof.js \
	spec/non-membrane/sealed-cyclic.js \
	spec/non-membrane/Promise.js \
	spec/non-membrane/generators.js \
	spec/non-membrane/iterators.js \
	spec/non-membrane/containers/array-splice.js \
	spec/DimensionalMap.js \
	spec/proxyHandlers/Forwarding.js \
	spec/concepts.js \
	spec/ecma/freeze-seal.js \
	spec/ecma/Promise.js \
	spec/ecma/generators.js \
	spec/ecma/iterators.js \
	spec/privateAPI.js \
	spec/features/replaceProxies.js \
	spec/features/passThroughFilters.js \
	spec/features/proxyListeners.js \
	spec/features/functionListeners.js \
	spec/features/manualBind.js \
	spec/features/primordials.js \
	spec/features/DistortionsListener.js \
	spec/properties/storeUnknownAsLocal.js \
	spec/properties/requireLocalDelete.js \
	spec/properties/filterOwnKeys.js \
	spec/properties/precedence.js \
	spec/properties/whitelist.js \
	spec/properties/truncateArgList.js \
	spec/containers/Array/tc39.js \
	spec/containers/Map/default.js \
	spec/containers/WeakMap/default.js \
	spec/containers/Set/default.js \
	spec/containers/WeakSet/default.js \
	spec/useCases/storeUnknownAsLocal.js \
	spec/useCases/requireLocalDelete.js \
	spec/useCases/filterOwnKeys.js \
	spec/useCases/whitelist.js \
	spec/useCases/disableTraps.js \
	spec/internal/lazyGetters.js \
	spec/security/exports.js \
	spec/security/ObjectGraphHandler.js \
	$(NULL)

specs::
	@cat $(ALL_SPEC_FILES) > $(DIST)/all-specs.js

clean::
	@rm -rf $(DIST)

BROWSER_MEMBRANE_FILES = \
  wrappers/browser/membrane-intro.js.in \
  wrappers/useStrict.js \
  $(DIST)/staging/es-membrane.js \
  wrappers/browser/membrane-outro.js.in \
  $(NULL)

BROWSER_HANDLERS_FILES = \
  wrappers/browser/handlers-intro.js.in \
  wrappers/useStrict.js \
  $(DIST)/staging/proxyHandlers.js \
  wrappers/browser/handlers-outro.js.in \
	$(NULL)

browser:: base mockDocs specs
	@mkdir -p $(DIST)/browser
	@cp wrappers/browser/fireJasmine.js $(DIST)/browser/fireJasmine.js
	@cp wrappers/browser/test-browser.xhtml $(DIST)/browser/test-browser.xhtml
	@cp $(DIST)/staging/DimensionalMap.js $(DIST)/browser/DimensionalMap.js
	@cat $(BROWSER_HANDLERS_FILES) > $(DIST)/browser/handlers.js
	@cat $(BROWSER_MEMBRANE_FILES) > $(DIST)/browser/es-membrane.js
	@cat wrappers/useStrict.js $(DIST)/staging/sharedUtilities.js > $(DIST)/browser/sharedUtilities.js
	@cat wrappers/useStrict.js $(DIST)/staging/mocks.js > $(DIST)/browser/mocks.js
	@cp wrappers/browser/assert.js $(DIST)/browser/assert.js
	@cp mocks/static.js $(DIST)/staging
	@rm -f $(DIST)/staging/*.zip
	@cd $(DIST) && zip -q staging/browser.zip browser/*.js staging/static.js
	@cd $(DIST) && zip -q staging/staging.zip browser/assert.js staging/*.js
	@echo "You may now open './$(DIST)/staging/test-browser.xhtml'."
	@echo "  (if Mozilla Firefox, version 51 or later is required)"

gui-tests::
	npm run gui-tests

NODE_DIST_FILES = \
	wrappers/useStrict.js \
	wrappers/node/require-assert.js \
	$(DIST)/staging/es-membrane.js \
	wrappers/node/export-membrane.js \
	$(NULL)

NODE_DIMENSIONALMAP_FILES = \
	wrappers/useStrict.js \
	$(DIST)/staging/DimensionalMap.js \
	wrappers/node/export-DimensionalMap.js \
	$(NULL)

NODE_HANDLERS_FILES = \
	wrappers/useStrict.js \
	wrappers/node/require-assert.js \
	wrappers/node/require-utilities.js \
	$(DIST)/staging/proxyHandlers.js \
	wrappers/node/export-proxyHandlers.js \
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
	@cat $(NODE_DIMENSIONALMAP_FILES) > $(DIST)/node/DimensionalMap.js
	@cat $(NODE_HANDLERS_FILES) > $(DIST)/node/proxyHandlers.js
	@cat $(NODE_DIST_FILES) > $(DIST)/node/es-membrane.js
	@cat $(NODE_MOCKS_FILES) > $(DIST)/node/mocks.js
	@cat $(NODE_UTILITIES_FILES) > $(DIST)/node/utilities.js

node-tests::	
	npm test
