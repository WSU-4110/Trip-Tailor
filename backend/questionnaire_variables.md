# Questionnaire Variable Overview

## Raw provider fields
- name
- location
- types/categories
- rating
- review_count
- price_level / price
- business_status (open/closed)
- phone / website 
- opening/closing hours

## TripTailor custom fields
- category
- tags
- effort_level
- family_friendly
- good_for_groups
- good_for_kids
- indoor_outdoor
- noise_level
- activity_level
- pet_friendly
- ticket_required
- reservations_required

### Where to find this data
- find this data and the rest of the data that we will store about each place in `backend/app/services/place_variables.py`
- to use it do something like the following (my code is for python so it might be different if using TS or another):
```python
from app.services.place_variables import build_google_place_variables
raw_place = google_results[0]
variables = build_google_place_variables(raw_place)
then for whatever actual variable you need:
rating = variables["rating"]
category = variables["category"]
effort_level = variables["effort_level"]
...

- the data will be stored in the database which you will have to query, I will lyk when it is all correctly stored.
```

## Important note
Some variables come directly from Google/Yelp.
Others are inferred by TripTailor from place types/categories.