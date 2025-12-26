import VideosShortcut from "./VideosShortcut"

const UserStats = () => {
  return (
    <div className="flex-col flex stats shadow bg-base-100">
        <div className="stats shadow bg-base-100 h-57">
            <div className="stat">
                <div className="stat-figure text-primary">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block h-8 w-8 stroke-current"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                </svg>
                </div>
                <div className="stat-title">Total Hours of Studying</div>
                <div className="stat-value text-primary">25.6K</div>
                <div className="stat-desc">21% more than last month</div>
            </div>
            <div className="stat">
                <div className="stat-figure text-secondary">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block h-8 w-8 stroke-current"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                </svg>
                </div>
                <div className="stat-title">Focus Rate</div>
                <div className="stat-value text-secondary">67%</div>
                <div className="stat-desc">3% more than last month</div>
            </div>
            <div className="stat">
                <div className="stat-figure text-secondary">
                    <div className="w-16 rounded-full pl-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-clock"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 7v5l3 3" /></svg>
                    </div>
                </div>
                <div className="stat-value text-secondary">86%</div>
                <div className="stat-title">Assessments done</div>
                <div className="stat-desc text-secondary">31 exams remaining</div>
            </div>
        </div>
        <div className="flex h-full">
            <VideosShortcut />
        </div>
    </div>
  )
}

export default UserStats