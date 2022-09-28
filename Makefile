# auto generate phony targets
.PHONY: $(shell grep --no-filename -E '^([a-zA-Z_-]|/)+:' $(MAKEFILE_LIST) | sed 's/:.*//')

setup: deps/pip deps/data

deps/pip:
	pip install -r requirements.txt

# https://pypi.org/project/unidic-lite/#files
deps/data:
	wget -c https://files.pythonhosted.org/packages/55/2b/8cf7514cb57d028abcef625afa847d60ff1ffbf0049c36b78faa7c35046f/unidic-lite-1.0.8.tar.gz

dev:
	FLASK_APP=src/app.py flask run --reload

deploy:
	vercel deploy

deploy/production:
	vercel deploy --prod
