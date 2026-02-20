
import Link from "next/link";

export default function OwnerDashBoard() {
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

       <Link href="/vehicle_repair_status_list">
          <button className="btn">Vehicle Repair Status List </button>
        </Link>

        <Link href="/ratings">
          <button className="btn">Ratings</button>
        </Link>

      </div>

      
    </div>
    </div>
  );
}
