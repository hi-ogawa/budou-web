.PHONY: pip dev deploy deploy/production

pip:
	pip install -r requirements.txt

dev:
	FLASK_APP=src/app.py flask run --reload

deploy:
	vercel deploy

deploy/production:
	vercel deploy --prod
