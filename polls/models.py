import datetime

from django.db import models
from django.utils import timezone

class Question(models.Model):
  text = models.CharField(max_length=200)
  pub_date = models.DateTimeField('date published')

  def was_published_recently(self):
    now = timezone.now()
    return now >= self.pub_date >= now - datetime.timedelta(days=1)

  def __str__(self):
    return self.text


class Choice(models.Model):
  question = models.ForeignKey(Question, on_delete=models.CASCADE)
  choice =  models.CharField(max_length=200)
  votes = models.IntegerField(default=0)

  def __str__(self):
    return self.choice

