// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "SubmitIncomingDealRequest",
	properties: [
		{
			class: "foam.core.String",
			name: "MethodID"
		},
		{
			class: "foam.core.String",
			name: "OrgID"
		},
		{
			class: "FObjectArray",
			name: "PaymentDetail",
			of: "net.nanopay.fx.ascendantfx.model.SubmitIncomingDealDetail"
		},
		{
			class: "foam.core.Long",
			name: "QuoteID",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "TotalNumberOfPayment",
			required: false
		}
	]
});