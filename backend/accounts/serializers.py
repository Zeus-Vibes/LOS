from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, CustomerProfile, ShopkeeperProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 
                 'last_name', 'phone_number', 'address', 'user_type')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        
        # Create profile based on user type
        if user.user_type == 'customer':
            CustomerProfile.objects.create(user=user)
        elif user.user_type == 'shopkeeper':
            ShopkeeperProfile.objects.create(
                user=user,
                business_name=validated_data.get('business_name', ''),
                business_address=validated_data.get('address', ''),
                business_phone=validated_data.get('phone_number', '')
            )
        
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'phone_number', 'address', 'user_type', 'profile_picture', 
                 'is_verified', 'created_at')
        read_only_fields = ('id', 'created_at', 'is_verified')

class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CustomerProfile
        fields = '__all__'

class ShopkeeperProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ShopkeeperProfile
        fields = '__all__'

class ShopkeeperRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    business_name = serializers.CharField(max_length=200)
    business_license = serializers.CharField(max_length=100, required=False)
    business_address = serializers.CharField()
    business_phone = serializers.CharField(max_length=17)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 
                 'last_name', 'phone_number', 'address', 'business_name', 
                 'business_license', 'business_address', 'business_phone')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        from shops.models import Shop, Category
        from datetime import time
        
        # Extract business data
        business_data = {
            'business_name': validated_data.pop('business_name'),
            'business_license': validated_data.pop('business_license', ''),
            'business_address': validated_data.pop('business_address'),
            'business_phone': validated_data.pop('business_phone'),
        }
        
        validated_data.pop('password_confirm')
        validated_data['user_type'] = 'shopkeeper'
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create shopkeeper profile
        ShopkeeperProfile.objects.create(user=user, **business_data)
        
        # Create shop for the shopkeeper
        shop = Shop.objects.create(
            owner=user,
            name=business_data['business_name'],
            description=f"Welcome to {business_data['business_name']}!",
            address=business_data['business_address'],
            phone=business_data['business_phone'],
            email=validated_data.get('email', ''),
            opening_time=time(9, 0),  # Default 9 AM
            closing_time=time(21, 0),  # Default 9 PM
            status='active'
        )
        
        # Add default category if exists
        default_category = Category.objects.first()
        if default_category:
            shop.categories.add(default_category)
        
        return user