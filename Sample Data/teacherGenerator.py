import random
import string
import sys
from openpyxl import Workbook
from faker import Faker

# ---------------- INIT ---------------- #

fake = Faker('ar_EG')

HEADERS = ['firstname', 'lastname', 'adj', 'number', 'departement', 'position', 'speciality', 'phone', 'email', 'image', 'password']

SPECIALITIES = [
    "Software Engineering",
    "Networks & Telecommunications",
    "Artificial Intelligence",
    "Cyber Security",
    "Information Systems",
    "Data Science",
    "Embedded Systems",
    "Web Technologies",
    "Cloud Computing",
    "Mobile Development",
    "Computer Vision",
    "Game Development",
    "Robotics",
    "Database Administration",
    "DevOps Engineering",
    "IOT Engineering",
    "High Performance Computing",
    "Human–Computer Interaction",
    "Computer Science General",
    "Virtual Reality"
]

ADJ = ["Mr", "Ms", "Mrs", "Dr", "Prof"]

POSITION =["Assistant", "Lecturer", "Associate Professor", "Professor"]

EMAIL_DOMAINS = [
    "gmail.com",
    "outlook.com",
    "yahoo.com",
    "univ.edu",
    "student.edu"
]

# ---------------- UTILS ---------------- #

def unique_digits(existing, digits):
    while True:
        value = ''.join(random.choices(string.digits, k=digits))
        if value not in existing:
            existing.add(value)
            return value

def resolve_optional(param, allowed_list):
    if param is None or param.lower() == "random":
        return random.choice(allowed_list)

    if param not in allowed_list:
        print(f"Invalid value: {param}")
        print(f"Allowed values: {allowed_list}")
        sys.exit(1)

    return param

# ---------------- MAIN ---------------- #

def generate_students(count, speciality=None, level=None):
    wb = Workbook()
    ws = wb.active
    ws.title = "students"

    ws.append(HEADERS)

    used_numbers = set()
    used_phones = set()
    used_emails = set()

    for _ in range(count):
        fname = fake.first_name()
        lname = fake.last_name()

        number = unique_digits(used_numbers, 8)
        password = number

        phone = unique_digits(used_phones, 10)

        domain = random.choice(EMAIL_DOMAINS)
        email = f"{fname.lower()}.{lname.lower()}@{domain}"
        while email in used_emails:
            email = f"{fname.lower()}.{lname.lower()}{random.randint(1,999)}@{domain}"
        used_emails.add(email)

        resolved_speciality = resolve_optional(speciality, SPECIALITIES)
        position = random.choice( POSITION)
        adj = random.choice(ADJ)

        image = f"https://api.dicebear.com/7.x/initials/svg?seed={fname}%20{lname}"

        ws.append([
            fname, lname, adj, number, 'Computer Science' ,position,
            resolved_speciality, phone,
            email, image, password
        ])

    wb.save("teachers.xlsx")
    print(f"teachers.xlsx generated with {count} teachers")

# ---------------- RUN ---------------- #

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python teacherGenerator.py <count> [speciality] [level]")
        sys.exit(1)

    try:
        count = int(sys.argv[1])
        speciality = sys.argv[2] if len(sys.argv) > 2 else None
        level = sys.argv[3] if len(sys.argv) > 3 else None

        generate_students(count, speciality, level)

    except ValueError:
        print("Count must be an integer")
