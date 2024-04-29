from pygrocy import Grocy

grocy = Grocy("http://172.21.80.245", "eUij63wXq4Ct5wWKIO1NDBfC5XX4Ofq55xtLPFA29w8OPgL4KB", port=80)

for entry in grocy.stock():
    print("{} in stock for product id {}".format(entry.available_amount, entry.id))