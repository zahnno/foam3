// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DiscountAmountType1Choice",
	documentation: "Specifies the amount type.",
	properties: [
		{
			class: "net.nanopay.iso20022.ExternalDiscountAmountType1Code",
			name: "Cd",
			shortName: "Cd",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Prtry",
			shortName: "Prtry",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});