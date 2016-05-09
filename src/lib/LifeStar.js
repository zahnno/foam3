foam.CLASS({
  package: 'foam.demos.graphics',
  name: 'LifeStar',
  extends: 'foam.graphics.Box',

  classes: [
    {
      name: 'Point',
      extends: 'foam.graphics.Circle',
      properties: [
        'z',
        [ 'radius',   3 ],
        [ 'border',   null ],
        [ 'arcWidth', 0 ],
        { class: 'Float', name: 'glowRadius' }
      ],
      methods: [
        function rotateY(a) {
          var x = this.x, z = this.z;
          this.z = z * Math.cos(a) - x * Math.sin(a);
          this.x = z * Math.sin(a) + x * Math.cos(a);
        },
        function rotateX(a) {
          var y = this.y, z = this.z;
          this.z = z * Math.cos(a) - y * Math.sin(a);
          this.y = z * Math.sin(a) + y * Math.cos(a);
        },
        function doTransform(x) {
          var t = this.transform;
          var s = 1 - this.z/300;
          t.scale(s, s);
          x.transform(t.a, t.d, t.b, t.e, t.c, t.f);
        },
        function paintSelf(x) {
          this.SUPER(x);
          if ( this.glowRadius ) {
            x.globalAlpha = 0.2;
            var oldR = this.radius;
            this.radius = this.glowRadius;
            this.SUPER(x);
            this.radius = oldR;
          }
        }
      ]
    }
  ],

  properties: [
    [ 'n',      197 ],
    [ 'x',      500 ],
    [ 'y',      350 ],
    [ 'width',  500 ],
    [ 'height', 500 ],
    [ 'time',   0 ],
    [ 'color', 'black' ]
  ],

  methods: [
    function initCView() {
      this.SUPER();
      for ( var i = 0 ; i < this.n ; i++ ) this.addChildren(this.Point.create());
    },
    function paint(x) {
      this.SUPER(x);

      var time = this.time++;

      for ( var i = 0 ; i < this.n ; i++ ) {
        var p = this.children[i];
        var r = Math.sin(Math.PI * i/this.n)*200;
        var a = (i-time/20)*Math.PI*15/this.n;

        p.x = Math.sin(a) * r;
        p.y = Math.cos(a) * r;
        p.z = Math.sqrt(40000 - p.x*p.x - p.y*p.y) * (( i > this.n/2 ) ? 1 : -1);

        p.rotateY(0.005*time);
        p.rotateX(0.003*time);

        var on = Math.abs((time % this.n - i + this.n)%this.n) < 20
        p.glowRadius = on ? 8 : 0;
        var s = on ? 100 : 70;
        var l = on ?  70 : 40;
        p.color = this.hsl(i*365/this.n, s, l);
      }

      this.invalidated.pub();
    }
  ]
});
