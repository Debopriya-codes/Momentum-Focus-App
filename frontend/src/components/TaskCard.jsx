function TaskCard({ task, toggleComplete, deleteTask }) {

  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center hover:bg-white/10 transition">

      <div className="flex items-center gap-3">

        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(task.id)}
        />

        <span className={task.completed ? "line-through text-gray-400" : ""}>
          {task.title}
        </span>

      </div>

      <button
        onClick={() => deleteTask(task.id)}
        className="text-red-400 hover:text-red-300"
      >
        Delete
      </button>

    </div>
  );
}

export default TaskCard;