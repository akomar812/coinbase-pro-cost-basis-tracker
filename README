Simple app for tracking cost basis of transactions on coinbase-pro built with Django, React, and Docker

Features:
  Track returns based on buy/sell history of coinbase-pro transactions
  Searchable, sortable, (hopefully one day) exportable

Requirements:
  Docker (and docker-compose if not on mac)
  nodejs

Getting started

  Frontend setup

    1. cd to the project root and run `npm install`
    2. run `npm run dev` to create an initial copy of the compiled GUI

  Backend setup

    Create API keys in coinbase and put them in a file in "~/costbasis/.coinbase.json", the json looks like:
      `
        {
          "key":"<key>",
          "passphrase":"<passphrase>",
          "secret":"<secret>"
        }
      `

    You will also need to set these values in "~/docker-config.yml":
      `
        - POSTGRES_DB=<dbname>
        - POSTGRES_USER=<username>
        - POSTGRES_PASSWORD=<password>
      `

   once everything can be installed run `docker-compose up`

  If everything worked the app should be running on port 8000 (or w/e you set in the Dockerfile) access
  the cost basis tool at `http://<host>:<port>/costbasis`

Issues
  - The biggest current issue that is being addressed is the app requiring a full load of orders, working on a solution to reduce the need for such a high amount of data loading every time but for now it's a present issue
