import datetime
import json

from django.db import models

def to_dict(instance):
  raw = instance.__dict__
  as_dict = {}

  for k, v in raw.items():
    if k[0] != '_':
      as_dict[k] = str(v)

  return as_dict


class Account(models.Model):
  currency = models.CharField(max_length=200)
  balance = models.DecimalField(decimal_places=20, max_digits=100)
  uuid = models.UUIDField(primary_key=True)

  def __str__(self):
    return json.dumps(to_dict(self))


class Transaction(models.Model):
  uuid = models.UUIDField(unique=True)
  date = models.DateTimeField('transaction date')
  asset = models.ForeignKey(Account, on_delete=models.CASCADE)
  quantity = models.DecimalField(decimal_places=10, max_digits=100)
  price = models.DecimalField(decimal_places=4, max_digits=100)
  side = models.TextField(max_length=20)

  def __str__(self):
    return json.dumps(to_dict(self))

