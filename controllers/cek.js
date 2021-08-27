onBtCart = () => {
    console.log("cek cart", this.props.cart)
    if (this.state.selectedType.type) {
        let idtb_user = this.props.id
        let idtb_product = this.state.detail.idtb_product
        let idtb_product_stok = this.state.selectedType.idtb_product_stok
        let qty = this.state.qty
        let index = this.props.cart.findIndex(item => item.idtb_product_stok == idtb_product_stok)
        console.log("cek index", index)
        console.log({ idtb_user: idtb_user, idtb_product: idtb_product, idtb_product_stok: idtb_product_stok, qty: qty })
        if (index >= 0) {
            this.props.cart[index].qty += qty
            console.log("QTY", this.props.cart[index].qty)
            let found = this.props.cart.find(item => item.idtb_product_stok == idtb_product_stok)
            console.log("IDCART", found.idtb_cart)
            axios.patch(URL_API + `/transaction/update-qty`, {
                qty: this.props.cart[index].qty, idtb_cart: found.idtb_cart
            }).then(res => {
                console.log("Res Cart:", res.data)
                this.props.updateCart(res.data)
            }).catch(err => console.log(err))
        } else {
            axios.post(URL_API + '/transaction/post-cart', {
                idtb_user, idtb_product, idtb_product_stok, qty
            }).then(res => {
                console.log("Res Cart:", res.data)
                this.props.updateCart(res.data)
            }).catch(err => console.log(err))
        }
    } else {
        alert('Choose product type first')
    }
}

