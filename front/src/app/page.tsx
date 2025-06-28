import type { BudgetRaw } from "@/utils/parseBudget";
import budgetStyles from "./budget.module.css";
import revenueData from "@/data/japan/2025/revenue.json";
import expenditureData from "@/data/japan/2025/expenditure.json";
import { parseBudget } from "@/utils/parseBudget";
import BudgetSunburst from "@/components/BudgetSunburst";

export default function Home() {
  const revenue = parseBudget(revenueData as BudgetRaw);
  const expenditure = parseBudget(expenditureData as BudgetRaw);

  return (
    <main className={budgetStyles.container}>
      <div className={budgetStyles.chart}>
        <BudgetSunburst data={revenue} />
        <p>歳入</p>
      </div>
      <div className={budgetStyles.chart}>
        <BudgetSunburst data={expenditure} />
        <p>歳出</p>
      </div>
    </main>
  );
}
