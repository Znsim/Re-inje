import requests
from bs4 import BeautifulSoup

url = ""

response = requests.get(url)

html = response.text

soup = BeautifulSoup(html,"html/parser")

