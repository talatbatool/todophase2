from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..dependencies import get_current_user
from ..models import Task, TaskCreate, TaskRead, TaskUpdate, User

router = APIRouter()

@router.post("/", response_model=TaskRead)
def create_task(
    *,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    task: TaskCreate,
):
    db_task = Task.from_orm(task, update={'owner_id': current_user.id})
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/", response_model=List[TaskRead])
def read_tasks(
    *,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    tasks = db.exec(select(Task).where(Task.owner_id == current_user.id)).all()
    return tasks


@router.get("/{task_id}", response_model=TaskRead)
def read_task(
    *,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    task_id: int,
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    return task


@router.put("/{task_id}", response_model=TaskRead)
def update_task(
    *,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    task_id: int,
    task_update: TaskUpdate,
):
    db_task = db.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    if db_task.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    task_data = task_update.dict(exclude_unset=True)
    for key, value in task_data.items():
        setattr(db_task, key, value)
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/{task_id}")
def delete_task(
    *,
    db: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    task_id: int,
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}