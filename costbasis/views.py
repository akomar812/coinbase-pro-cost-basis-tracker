import cbpro
import json
import sys

from django.http import HttpResponse
from django.template import loader
from .models import Account, Transaction

with open('./costbasis/.coinbase.json') as f:
  data = json.load(f)
  key = data['key']
  passphrase = data['passphrase']
  secret = data['secret']

def index(request):
  template = loader.get_template('costbasis/index.html')
  return HttpResponse(template.render({}, request))


def portfolio(request):
  auth_client = cbpro.AuthenticatedClient(key, secret, passphrase)
  accounts = auth_client.get_accounts()
  totals = {}
  transactions = []

  for a in accounts:
    account = Account(uuid=a['id'], currency=a['currency'], balance=a['balance'])
    account.save()
    fills = auth_client.get_fills(a['currency']+'-USD')

    for f in fills:
      if not isinstance(f, str):
        try:
          account.transaction_set.create(date=f['created_at'], quantity=float(f['size']), price=float(f['price']), uuid=f['order_id'], side=f['side'])
        except:
          print('Encountered transaction which seems to exist: ('+a['currency']+','+f['order_id']+','+f['size']+','+f['price']+','+f['side']+')')

        t = account.transaction_set.get(uuid=f['order_id'])
        transactions.append({'asset':t.asset.currency, 'date':str(t.date), 'side':t.side, 'quantity':float(t.quantity), 'price':float(t.price)})

  return HttpResponse(json.dumps(transactions), content_type='application/json')


def prices(request):
  public_client = cbpro.PublicClient()
  prices = {}
  assets = []

  try:
    assets = json.loads(request.GET.get('assets', '[]'))
  except:
    print("Unexpected error:", sys.exc_info()[0])

  for asset in assets:
    ticker = public_client.get_product_ticker(asset+'-USD')
    prices[asset] = float(ticker['price'])

  return HttpResponse(json.dumps(prices), content_type='application/json')
