import config
import gspread

# print(f"koyeb app name = {config.KOYEB_APP_NAME}", flush=True)
# print(f"sheet name = {config.SHEET_NAME}", flush=True)
# for key,value in config.SHEET_CREDENTIALS.items():
#     print(f"{key} = {value}", flush=True)

gc = gspread.service_account_from_dict(config.SHEET_CREDENTIALS)
sheet = gc.open(config.SHEET_NAME).sheet1


def update_movie(id, title, director, watched):
    try:
        title_cell = id
        sheet.update(title_cell, title)

        director_cell = f"B{title_cell[1:]}"
        sheet.update(director_cell, director)

        watched_cell = f"C{title_cell[1:]}"
        sheet.update(watched_cell, watched)

        return director_cell
    except Exception as err:
        return err


def add_movie(title, director, watched):
    try:
        row = next_available_row(sheet)

        title_cell = f"A{row}"
        sheet.update(title_cell, title)

        director_cell = f"B{row}"
        sheet.update(director_cell, director)

        watched_cell = f"C{row}"
        sheet.update(watched_cell, watched)

    except Exception as err:
        return err
