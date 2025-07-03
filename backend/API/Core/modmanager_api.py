import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

PROFILES_FILE = "pz_profiles.json"

def load_profiles():
    if os.path.exists(PROFILES_FILE):
        with open(PROFILES_FILE, "r") as f:
            return json.load(f)
    return {"profiles": {}, "categories": {}}

def save_profiles(data):
    with open(PROFILES_FILE, "w") as f:
        json.dump(data, f, indent=2)

class ProfileSaveRequest(BaseModel):
    profile_name: str
    mods: List[str]

class CategorySaveRequest(BaseModel):
    category_name: str
    mods: List[str]

class ProfileDeleteRequest(BaseModel):
    profile_name: str

class CategoryDeleteRequest(BaseModel):
    category_name: str

@app.get("/profiles")
def get_profiles():
    return load_profiles()

@app.post("/profiles/save")
def save_profile(request: ProfileSaveRequest):
    data = load_profiles()
    data["profiles"][request.profile_name] = request.mods
    save_profiles(data)
    return {"message": f"Profile '{request.profile_name}' saved."}

@app.post("/categories/save")
def save_category(request: CategorySaveRequest):
    data = load_profiles()
    data["categories"][request.category_name] = request.mods
    save_profiles(data)
    return {"message": f"Category '{request.category_name}' saved."}

@app.post("/profiles/delete")
def delete_profile(request: ProfileDeleteRequest):
    data = load_profiles()
    if request.profile_name in data["profiles"]:
        del data["profiles"][request.profile_name]
        save_profiles(data)
        return {"message": f"Profile '{request.profile_name}' deleted."}
    else:
        raise HTTPException(status_code=404, detail="Profile not found")

@app.post("/categories/delete")
def delete_category(request: CategoryDeleteRequest):
    data = load_profiles()
    if request.category_name in data["categories"]:
        del data["categories"][request.category_name]
        save_profiles(data)
        return {"message": f"Category '{request.category_name}' deleted."}
    else:
        raise HTTPException(status_code=404, detail="Category not found")
