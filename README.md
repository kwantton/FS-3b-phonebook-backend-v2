PUBLICLY AVAILABLE ADDRESS FOR THE APP:
https://fs-3b-phonebook-backend-v2.onrender.com

- the requests in the folder /requests work (they have the correct app address also).

In GitHub, this is phonebook-backend-v2. This was created so that the backend and frontend would be in different repos, so that there will be no problem with the .git folder making it impossible to open the backend in GitHub (which is dumb)

NOTE! ESlint v9+ have changed from .eslintrc.js to eslint.config.js. The material had .eslintrc.js. 
- atm, use “export ESLINT_USE_FLAT_CONFIG=false && npx eslint index.js” when you're linting index.js, for example
- the used solution is to https://eslint.org/docs/latest/use/migrate-to-9.0.0 add to use the "ESLINT_USE_FLAT_CONFIG=false" as written above and keep using the "old" (pre-v9) ESlint config file. 

Another solution for the ESlint "problem" would be to manually rewrite the old format to match the new one according to https://eslint.org/docs/latest/use/configure/migration-guide
