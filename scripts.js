const Modal = {
    open(){
        //Abrir modal
        //Adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active')
        //Pegue todo o documento e procure a classe modal-overlay, e dentro dessa clasList adicione a classe active
    },
    close(){
        //fechar o modal
        //remover a class active do modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finance:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finance:transactions", JSON.stringify(transactions))
        //Transformei o array em uma string e levei para o localStorage
    }
}

const Transaction = {
    all: Storage.get(), //Refatorando algo para facilitar a alteraçãoo depois

    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        //Pega o index do array e remova só 1

        App.reload()
    },

    incomes() {
        //Somar as entradas
        let income = 0
        // pegar todas as transações
        // para cada transação
        Transaction.all.forEach(function(transaction) {
            // verificar se a transação é maior que zero

            if (transaction.amount > 0) {
                 // Se for maior que zero somar a uma variavel e
                 income += transaction.amount
            }
        })
        // retornar a variavel
        return income
    },

    expenses() {
        //Somar as saídas
        let expense = 0
        // pegar todas as transações
        // para cada transação
        Transaction.all.forEach(function(transaction) {
            // verificar se a transação é maior que zero

            if (transaction.amount < 0) {
                 // Se for maior que zero somar a uma variavel e
                 expense += transaction.amount
            }
        })
        // retornar a variavel
        return expense
    },

    total() {
        // incomes - expenses
        return Transaction.incomes() + Transaction.expenses()
    }
}
//Eu preciso pegar as minhas transações do meu objeto no javascript e colocar lá no HTML
const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTmlTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },

    innerHTmlTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <tr>
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        </tr>
        `
        //Corpo que vai ter que se repetir no html

        return html
    },

    updateBalance() {
        //Soma das entradas
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())//Pegando a função acima e mostrando no html junto co a formatação da moeda
        //Soma da saídas
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        //Total
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransaction(){
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = Number(value) * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        //Tirando o - que vem por padrão e transformando ele em uma array
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
        //Pega os indeces dele e retornando ele na ordem desejadas 
    },

    formatCurrency (value) {
        const signal = Number(value) < 0 ? "-" : ""
        //Pegando o parametro que foi atribuido e
        //Se ele for menor que 0 coloque o sinal de -

        value = String(value).replace(/\D/g, "")
        //Trabalhando a remoção de qualquer caracter especial
        
        value =  Number(value) / 100
        //Divido o  número por 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        //Converto pra real Brasileiro

        return signal + value
        //Retorno o sinal mais o valor
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }

        //Objeto com os valores
    },

    validateField() {
        const { description, amount , date } = Form.getValues()

        //O trim faz uma limpeza de espaço vazio
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
        throw new Error("Por favor, preencha todos os campos.")
        }
    },

    formatValues() {
        let { description, amount , date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        //Depois de formatar e altera tudo como desejado
        //Vou retornar os valores que preciso

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()
        //Não realize o comportamento padrão do form

        try {
            //Verificar se todas as informções foram preenchidas
            Form.validateField()
            //Formatar os dados para salvar
            const transaction = Form.formatValues()
            //Salvar
            Form.saveTransaction(transaction)
            //Apagar os dados do form
            Form.clearFields()
            //Modal feche
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
        
    }
}

const App = {
    init() {
        //Adicionando tabela
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance();
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransaction()
        App.init()
    }
}

App.init() // iniciando a aplicação

