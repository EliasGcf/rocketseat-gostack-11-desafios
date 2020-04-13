import Transaction from '../models/Transaction';

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const income = this.transactions.reduce((incomeIncrement, transaction) => {
      if (transaction.type === 'income') {
        return incomeIncrement + transaction.value;
      }

      return incomeIncrement + 0;
    }, 0);

    const outcome = this.transactions.reduce(
      (outcomeIncrement, transaction) => {
        if (transaction.type === 'outcome') {
          return outcomeIncrement + transaction.value;
        }

        return outcomeIncrement + 0;
      },
      0,
    );

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }

  public create({ title, value, type }: CreateTransactionDTO): Transaction {
    const transaction = new Transaction({ title, value, type });

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
