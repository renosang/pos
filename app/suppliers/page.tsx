import { getSuppliers } from "@/app/actions/supplier";
import SupplierList from "@/components/SupplierList";

export default async function SuppliersPage() {
    const suppliers = await getSuppliers();

    return (
        <SupplierList initialSuppliers={suppliers} />
    );
}
