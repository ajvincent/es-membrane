all:: clean node-tests gui-tests

.PHONY:: clean base all travis-ci node-tests gui-tests

DIST=docs/dist

travis-ci:: all
ifneq ("$(shell git status --porcelain)","")
	@echo "This test fails because the build process changed some files that haven't been committed yet."
	@exit 1;
endif

base::
	npm run rollup

clean::
	@rm -rf $(DIST)

gui-tests::
	npm run gui-tests

node-tests::
	npm test
