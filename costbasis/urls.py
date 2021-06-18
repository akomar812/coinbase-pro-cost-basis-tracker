from django.urls import path
from . import views

app_name = 'costbasis'

urlpatterns = [
  path('', views.index, name='index'),
  path('portfolio/', views.portfolio, name='portfolio'),
  path('prices/', views.prices, name='portfolio'),
]
