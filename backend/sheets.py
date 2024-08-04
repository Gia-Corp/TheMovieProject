from config import CREDENTIALS 
import gspread
import os

print (os.environ.get("KOYEB_APP_NAME"),flush=True)

def next_available_row(worksheet):
    str_list = list(filter(None, worksheet.col_values(1)))
    return str(len(str_list))

SHEET_NAME = 'test_movieproject'

for key,value in CREDENTIALS.items():
    print(f"{key} = {value}",flush=True)

gc = gspread.service_account_from_dict(CREDENTIALS)
sheet = gc.open(SHEET_NAME).sheet1

def list_all_movies ():
    try:
        row = str(int(next_available_row(sheet))-1)
        list = sheet.get(f'2:{row}')
        #list = sheet.get_all_records()
        return list
    except (Exception) as err:
        return err

def update_movie (id,title,director,watched):
    try:
        title_cell = id
        sheet.update(title_cell, title)

        director_cell = f'B{title_cell[1:]}'
        sheet.update(director_cell, director)

        watched_cell = f'C{title_cell[1:]}'
        sheet.update(watched_cell, watched)

        return director_cell
    except (Exception) as err:
        return err

def add_movie (title,director,watched):
    try:
        row = next_available_row(sheet)

        title_cell = f'A{row}'
        sheet.update(title_cell, title)

        director_cell = f'B{row}'
        sheet.update(director_cell, director)

        watched_cell = f'C{row}'
        sheet.update(watched_cell, watched)

    except (Exception) as err:
        return err
