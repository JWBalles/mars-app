
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="container">
      <div className="dashboard">
      <h1 className="title">Mar's Auto Repair Shop</h1>
      <div className="grid">

        <Link href="/pending_repairs">
          <button className="btn">Pending Repairs</button>
        </Link>

        <Link href="/customers">
          <button className="btn">Customers</button>
        </Link>

       <Link href="/repair_history">
          <button className="btn">Repair History</button>
        </Link>

        <Link href="/ratings">
          <button className="btn">Ratings</button>
        </Link>

      </div>

      
    </div>
    </div>
  );
}
