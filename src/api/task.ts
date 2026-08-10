import api from "./axios";

/* =========================================================
   CREATE TASK
========================================================= */

export interface CreateTaskPayload {
  projectId?: string;
  assignedTo: string[];
  title: string;
  description: string;
  dueDate: string;
}

export interface TaskAssignee {
  employee: {
    _id: string;
    employeeId: string;
    fullName: string;
    profileImage?: string;
  };
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  _id: string;
}

export interface CreatedTask {
  _id: string;

  project?: {
    _id: string;
    projectName: string;
  };

  title: string;
  description: string;

  assignedBy: string;

  assignedTo?: string;

  assignees: TaskAssignee[];

  dueDate: string;

  status?: "Pending" | "In Progress" | "Completed";

  progress?: number;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskResponse {
  success: boolean;
  message: string;
  task: CreatedTask;
}

export interface MyCreatedTasksResponse {
  success: boolean;
  total: number;
  tasks: CreatedTask[];
}

export const createTask = async (
  data: CreateTaskPayload
): Promise<CreateTaskResponse> => {
  try {
    const response = await api.post<CreateTaskResponse>(
      "/tasks",
      data
    );

    return response.data;
  } catch (error) {
    console.error("Create Task Error:", error);
    throw error;
  }
};

/* =========================================================
   GET TASKS CREATED BY LOGGED-IN EMPLOYEE
========================================================= */

export const getMyCreatedTasks = async (): Promise<CreatedTask[]> => {
  try {
    const response =
      await api.get<MyCreatedTasksResponse>(
        "/tasks/my-created"
      );

    return response.data.tasks;
  } catch (error) {
    console.error("Get My Created Tasks Error:", error);
    throw error;
  }
};

/* =========================================================
   EMPLOYEE ASSIGNED TASK
========================================================= */

export interface MyTask {
  _id: string;

  project?: {
    _id: string;
    projectName: string;
  };

  title: string;
  description: string;

  assignedBy: {
    profileImage?: string;
    _id: string;
    employeeId: string;
    fullName: string;
  };

  dueDate: string;

  status: "Pending" | "In Progress" | "Completed";

  progress: number;

  createdAt: string;
  updatedAt: string;
}

export interface MyTasksResponse {
  success: boolean;
  total: number;
  tasks: MyTask[];
}

/* =========================================================
   GET TASKS ASSIGNED TO LOGGED-IN EMPLOYEE
========================================================= */

export const getMyTasks = async (): Promise<MyTask[]> => {
  try {
    const response =
      await api.get<MyTasksResponse>(
        "/tasks/my-tasks"
      );

    return response.data.tasks;
  } catch (error) {
    console.error("Get My Tasks Error:", error);
    throw error;
  }
};

/* =========================================================
   UPDATE TASK PROGRESS RESPONSE
========================================================= */

export interface UpdateTaskProgressAssignee {
  employee: {
    profileImage?: string;
    _id: string;
    employeeId: string;
    fullName: string;
  };

  status: "Pending" | "In Progress" | "Completed";

  progress: number;

  _id: string;
}

export interface UpdateTaskProgressTask {
  _id: string;

  project?: {
    _id: string;
    projectName: string;
  };

  title: string;

  description: string;

  assignedBy: {
    profileImage?: string;
    _id: string;
    employeeId: string;
    fullName: string;
  };

  assignees: UpdateTaskProgressAssignee[];

  dueDate: string;

  createdAt: string;

  updatedAt: string;
}

export interface UpdateTaskProgressResponse {
  success: boolean;
  message: string;
  task: UpdateTaskProgressTask;
}

/* =========================================================
   NORMALIZED UPDATE RESULT
========================================================= */

export interface UpdatedTaskProgress {
  progress: number;
  status: "Pending" | "In Progress" | "Completed";
}

/* =========================================================
   UPDATE TASK PROGRESS
========================================================= */

export const updateTaskProgress = async (
  taskId: string,
  progress: number
): Promise<UpdatedTaskProgress> => {
  try {
    const response =
      await api.put<UpdateTaskProgressResponse>(
        `/tasks/${taskId}`,
        {
          progress,
        }
      );

    const updatedAssignee =
      response.data.task.assignees[0];

    if (!updatedAssignee) {
      throw new Error(
        "Updated task assignee information was not returned"
      );
    }

    return {
      progress: updatedAssignee.progress,
      status: updatedAssignee.status,
    };
  } catch (error) {
    console.error("Update Task Progress Error:", error);
    throw error;
  }
};
